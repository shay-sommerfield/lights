import React, {useState, useEffect} from "react";
import LightButton from './LightButton';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Stack } from "@mui/material";
import theme from './theme';

function App(){
    //connect to light server and determine which light programs are available
    const [programs, setPrograms] = useState(null);
    const [gotPrograms, setGotPrograms] = useState(false);
    useEffect(() => {
        const lightAPI = async () => {
        try {
            const response = await fetch("/api/get_programs/");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            console.log("Data from get_programs:", data);
            setPrograms(data);
            setGotPrograms(true);
        } catch (error) {
            console.error(`Error fetching get_programs:`, error);
        }
        };
        lightAPI();
    }, []);

    //if data is retrieved, dynamically add all the necessary buttons
    return(
    <div>
        <h1>Three Orb Control Panel</h1>
        <ThemeProvider theme={theme}>
        <Stack spacing={2} direction="row" id="button-container" color="primary">
        {gotPrograms ? programs.map((program) => (
            <LightButton key={program.name} label={program.name} endpoint={program.func}></LightButton>
        )) : <Box color="primary.contrastText">No Programs Found</Box>
        }
        </Stack>
        </ThemeProvider>
    </div>
    );
}

export default App;