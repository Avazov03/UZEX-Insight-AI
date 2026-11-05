import type { Locale } from '../config';
import type { MessageTree } from './uz';
import { uz } from './uz';
import { ru } from './ru';
import { en } from './en';

export const messages: Record<Locale, MessageTree> = { uz, ru, en };

export type { MessageTree };
