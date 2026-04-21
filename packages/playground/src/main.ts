import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import Tooltip from "primevue/tooltip";
import Ripple from "primevue/ripple";
import { GeneratedPreset } from "./generated/preset";
import router from "./router";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: GeneratedPreset,
        options: {
            darkModeSelector: ".dark",
            cssLayer: {
                name: "primevue",
                // UnoCSS utilities (in the unutilities layer) override PrimeVue
                // component defaults so one-off utility tweaks always win.
                order: "unbase, primevue, unutilities",
            },
        },
    },
});

app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);
app.use(router);

app.directive("tooltip", Tooltip);
app.directive("ripple", Ripple);

app.mount("#app");
