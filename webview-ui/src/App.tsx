import { grey } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";

import Page from "./Page";
import { createTT, TensorTrain } from "./tensortrain/TT";
import { parseNpz } from "./utilities/parseNpz";
import { vscode } from "./utilities/vscode";

const App = () => {
    const [tt, setTT] = useState<TensorTrain | null>(null);

    window.addEventListener("message", async (e) => {
        const { type, body } = e.data;
        switch (type) {
            case "init": {
                try {
                    const entries = await parseNpz(body.value.buffer);
                    entries.sort((a, b) => a.key.localeCompare(b.key));

                    const cores = entries.map((x) => x.data);
                    const tt = createTT(cores);
                    setTT(tt);
                } catch (e) {
                    console.error(e);
                    alert(e);
                }

                break;
            }
        }
    });

    useEffect(() => {
        vscode.postMessage({ type: "ready" });
    }, []);

    const theme = createTheme({
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    "body::-webkit-scrollbar": {
                        width: "10px",
                        height: "10px",
                    },
                    "::-webkit-scrollbar": {
                        width: "10px",
                        height: "10px",
                    },
                    "::-webkit-scrollbar-track": {
                        background: grey[100],
                    },
                    "::-webkit-scrollbar-thumb": {
                        background: grey[400],
                        borderRadius: "5px",
                    },
                    "::-webkit-scrollbar-thumb:hover": {
                        background: grey[600],
                    },
                },
            },
        },
    });

    return (
        <main
            style={{
                paddingTop: 20,
                paddingBottom: 20,
                scrollbarColor: "auto",
                scrollbarWidth: "auto",
            }}
            data-vscode-context='{"preventDefaultContextMenuItems": true}'>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {tt === null ? <div>Loading...</div> : <Page tt={tt} title="" />}
            </ThemeProvider>
        </main>
    );
};

export default App;
