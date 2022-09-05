import { AppConfig } from "./app"

export type AuthParams = {
    state: string | null,
    app: AppConfig,
}