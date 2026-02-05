import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = join(fileURLToPath(import.meta.url), "..");

export default {
  plugins: {
    tailwindcss: {
      config: join(__dirname, "tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
