import React, {useState, useEffect} from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App(){
    //test connection to backend
    const [data, setData] = useState(null);
    let isData = false;
    useEffect(() => {
        const callBackendAPI = async () => {
        try {
            const response = await fetch("/api/get_programs/");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            else {
                isData = true;
                const body = await response.json();
                setData(body.message);
                console.log(data);
            }
        } catch (error) {
            console.error(error.message);
        }
        };
        callBackendAPI();
    }, []);

    //if data is retrieved, dynamically add all the necessary buttons, otherwise, only return one button
    //TODO: test proper function retrieval with backend and add onClick response
    return(
    <div>
        <h1>Three Orb Control Panel</h1>
        <ThemeProvider theme={theme}>
        <Stack spacing={2} direction="row" id="button-container" color="primary">
        {isData ? data.map((program) => (
            <Button variant="contained" color="primary" key={program.name} value={program.func}>{program.name}</Button>
        )) : <Button variant="contained" color="secondary" value="">No Programs Found</Button>}
        </Stack>
        </ThemeProvider>
    </div>
    );
}

export default App;