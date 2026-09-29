const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: ".",
    projects: [
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
            },
        },
    ],
});