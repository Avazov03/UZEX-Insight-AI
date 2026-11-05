#!/usr/bin/env python3
"""Stream-import UZEX synthetic CSVs into PostgreSQL."""
from __future__ import annotations

import csv
import os
import sys
from datetime import datetime
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_batch

DATA = Path(os.environ.get('UZEX_DATA_DIR', '/var/www/uzex-insight/data'))
DSN = os.environ.get(
  'DATABASE_URL',
  'postgresql://uzex:UzexInsight2026@127.0.0.1:5432/uzex_insight'
)


def parse_date(value: str):
  value = (value or '').strip()
  if not value:
    return None
  return datetime.strptime(value, '%d.%m.%Y').date()


def parse_time(value: str):
  value = (value or '').strip()
  if not value:
    return None
  return datetime.strptime(value, '%H:%M:%S').time()


def parse_num(value: str):
  value = (value or '').strip().replace(' ', '').replace('\u00a0', '')
  if not value:
    return None
  return float(value)


def connect():
  return psycopg2.connect(DSN)


def load_brokers(cur):
  path = DATA / 'brokers.csv'
  with path.open('r', encoding='utf-8') as f:
    rows = [
      (
        r['Код брокера'],
        r['Наименование'],
        r['ИНН'],
        r['Регион'],
      )
      for r in csv.DictReader(f)
    ]
  execute_batch(
    cur,
    """
    INSERT INTO brokers(code, name, inn, region)
    VALUES (%s,%s,%s,%s)
    ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, inn=EXCLUDED.inn, region=EXCLUDED.region
    """,
    rows,
    page_size=500,
  )
  print(f'brokers: {len(rows)}')


def load_participants(cur):
  path = DATA / 'participants.csv'
  rows = []
  with path.open('r', encoding='utf-8') as f:
    for r in csv.DictReader(f):
      rows.append(
        (
          r['ИНН'],
          r['Наименование'],
          r['Регион'],
          r['Вид деятельности'],
          r['Роль'],
          r['Плательщик НДС'],
        )
      )
  execute_batch(
    cur,
    """
    INSERT INTO participants(inn, name, region, activity, role, vat_payer)
    VALUES (%s,%s,%s,%s,%s,%s)
    ON CONFLICT (inn) DO UPDATE SET
      name=EXCLUDED.name, region=EXCLUDED.region, activity=EXCLUDED.activity,
      role=EXCLUDED.role, vat_payer=EXCLUDED.vat_payer
    """,
    rows,
    page_size=1000,
  )
  print(f'participants: {len(rows)}')


def load_rates(cur):
  path = DATA / 'usd_rates.csv'
  rows = []
  with path.open('r', encoding='utf-8') as f:
    for r in csv.DictReader(f):
      rows.append((parse_date(r['Дата']), parse_num(r['Курс'])))
  execute_batch(
    cur,
    """
    INSERT INTO usd_rates(rate_date, rate) VALUES (%s,%s)
    ON CONFLICT (rate_date) DO UPDATE SET rate=EXCLUDED.rate
    """,
    rows,
    page_size=1000,
  )
  print(f'usd_rates: {len(rows)}')


def load_contracts(cur):
  path = DATA / 'contracts.csv'
  rows = []
  with path.open('r', encoding='utf-8') as f:
    for r in csv.DictReader(f):
      rows.append(
        (
          r['Номер контракта'],
          r['Наименование продукта'],
          r['Марка товара'],
          r['Размер товара'],
          r['Сорт товара'],
          r['Тип товара'],
          r['Класс товара'],
          r['Код ТН ВЭД'],
          r['Группа товара'],
          r['Категория товара'],
          r['Отрасль промышленности'],
          r['Единица измерения'],
          parse_num(r['Лот']),
          r['Валюта'],
          parse_num(r['Базисная цена']),
          r['Сумма залога'],
          r['Базис поставки'],
          r['Регион'],
          r['Адрес склада'],
          r['Тип торгов'],
          r['Тип контракта'],
          r['Форма контракта'],
          int(r['Срок оплаты'] or 0) if str(r['Срок оплаты']).strip() else None,
          int(r['Срок поставки'] or 0) if str(r['Срок поставки']).strip() else None,
          r['Упаковка'],
          r['ИНН продавца'],
          parse_date(r['Дата регистрации']),
          parse_date(r['Действует до']),
        )
      )
  execute_batch(
    cur,
    """
    INSERT INTO contracts(
      contract_no, product_name, brand, size, grade, product_type, product_class,
      tnved, product_group, category, industry, unit, lot, currency, base_price,
      deposit_pct, delivery_basis, region, warehouse_address, trade_type,
      contract_type, contract_form, payment_days, delivery_days, packaging,
      seller_inn, registered_at, valid_until
    ) VALUES (
      %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
    )
    ON CONFLICT (contract_no) DO NOTHING
    """,
    rows,
    page_size=500,
  )
  print(f'contracts: {len(rows)}')


def load_deals(cur, year: int):
  path = DATA / f'deals_{year}.csv'
  if not path.exists():
    print(f'skip missing {path}')
    return
  batch = []
  count = 0
  with path.open('r', encoding='utf-8') as f:
    for r in csv.DictReader(f):
      batch.append(
        (
          r['Номер сделки'],
          parse_date(r['Дата сделки']),
          parse_time(r['Время сделки']),
          r['Тип торгов'],
          parse_num(r['Количество']),
          parse_num(r['Сумма сделки']),
          parse_num(r['Стартовая цена']),
          r['Номер контракта'],
          r['Наименование товара'],
          parse_num(r['Лот']),
          r['Единица измерения'],
          r['Регион'],
          r['Тип контракта'],
          r['Форма контракта'],
          r['Состояние сделки'],
          r['ИНН продавца'],
          r['ИНН покупателя'],
          r['Брокер продавца'],
          r['Брокер покупателя'],
          parse_date(r['Дата оплаты']),
          parse_date(r['Дата поставки']),
          parse_num(r['Поставлено']),
        )
      )
      if len(batch) >= 2000:
        execute_batch(
          cur,
          """
          INSERT INTO deals(
            deal_no, deal_date, deal_time, trade_type, quantity, amount, start_price,
            contract_no, product_name, lot, unit, region, contract_type, contract_form,
            status, seller_inn, buyer_inn, seller_broker, buyer_broker, payment_date,
            delivery_date, delivered
          ) VALUES (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
          )
          ON CONFLICT (deal_no) DO NOTHING
          """,
          batch,
          page_size=2000,
        )
        count += len(batch)
        batch.clear()
        print(f'  deals_{year}: {count}', flush=True)
  if batch:
    execute_batch(
      cur,
      """
      INSERT INTO deals(
        deal_no, deal_date, deal_time, trade_type, quantity, amount, start_price,
        contract_no, product_name, lot, unit, region, contract_type, contract_form,
        status, seller_inn, buyer_inn, seller_broker, buyer_broker, payment_date,
        delivery_date, delivered
      ) VALUES (
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
      )
      ON CONFLICT (deal_no) DO NOTHING
      """,
      batch,
      page_size=2000,
    )
    count += len(batch)
  print(f'deals_{year}: {count}')


def main():
  if not DATA.exists():
    print(f'Data dir missing: {DATA}', file=sys.stderr)
    sys.exit(1)
  conn = connect()
  conn.autocommit = False
  try:
    with conn.cursor() as cur:
      load_brokers(cur)
      conn.commit()
      load_participants(cur)
      conn.commit()
      load_rates(cur)
      conn.commit()
      load_contracts(cur)
      conn.commit()
      for year in range(2022, 2027):
        load_deals(cur, year)
        conn.commit()
      cur.execute('SELECT COUNT(*) FROM deals')
      print('TOTAL_DEALS', cur.fetchone()[0])
  finally:
    conn.close()


if __name__ == '__main__':
  main()
