import path from 'path'
import { I18n } from '@edjopato/telegraf-i18n'

export const i18n = new I18n({
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: path.resolve(__dirname, '../../locales'),
  useSession: true,
  sessionName: 'session',
  allowMissing: true,
  // hideErrors: true,
})
