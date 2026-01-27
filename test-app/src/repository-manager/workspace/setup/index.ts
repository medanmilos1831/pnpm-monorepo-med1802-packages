import type { IWorkspaceConfig } from "../../types";
import { setupProvider } from "./context";
import { createApp } from "./createApp";

function setup<D = any>(config: IWorkspaceConfig<D>){
    let app = undefined as any;

    setupProvider(config, () => {

        app = createApp();

    });
    return app
}

export { setup };
