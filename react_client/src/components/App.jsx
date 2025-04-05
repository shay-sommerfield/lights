import React, {useState, useEffect} from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App(){
    //test connection to backend
    const [data, setData] = useState(null);
    useEffect(() => {
        const callBackendAPI = async () => {
        try {
            const response = await fetch("/api/get_programs/");
            if (!response.ok) {
            throw new Error("Failed to fetch data");
            }
            console.log(response);
            const body = await response.json();
            setData(body.message);
            console.log(data);
        } catch (error) {
            console.error(error.message);
        }
        };
        callBackendAPI();
    }, []);

    return(
    <div id="wrapper">
        <h1>Three Orb Control Panel</h1>
        <ThemeProvider theme={theme}>
        <Stack spacing={2} direction="row" id="button-container" color="primary">
        <Button variant="text" color="primary">Text</Button>
        <Button variant="contained" color="secondary">Contained</Button>
        <Button variant="outlined" color="primary">Outlined</Button>
        </Stack>
        </ThemeProvider>
    </div>
    );
}

export default App;