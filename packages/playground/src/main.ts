import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import Tooltip from "primevue/tooltip";
import Ripple from "primevue/ripple";
import { primevuePT } from "./generated/primevue-pt";
import { GeneratedPreset } from "./generated/primevue-preset";
import "./generated/primevue-base.css";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: GeneratedPreset,
        options: {
            darkModeSelector: ".dark"
        }
    },
    pt: primevuePT
});

app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

app.directive("tooltip", Tooltip);
app.directive("ripple", Ripple);

app.mount("#app");
