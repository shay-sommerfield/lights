import React, {useState, useEffect} from "react";
import LightButton from './LightButton';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from "@mui/material";
import theme from './theme';

function App(){
    //connect to light server and determine which light programs are available
    const [programs, setPrograms] = useState(null);
    const [gotPrograms, setGotPrograms] = useState(false);

    useEffect(() => {
        const lightAPI = async () => {
        try {
            const response = await fetch("/express/get_programs/");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const programData = await response.json();
            console.log("Data from get_programs:", programData);
            setPrograms(programData);
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
        <ThemeProvider theme={theme}>
        <h1 className="site-title">Three Orb Control Panel</h1>
        <Box className="program-container" color="primary">
        {gotPrograms ? (
          <>
            {/* Param programs */}
            {programs
              .filter(program => Array.isArray(program.param))
              .map(program => (
                <Box key={program.name} className="param-container" display="flex" flexDirection="column" alignItems="center">
                  <h3>{program.name}</h3>
                  {program.param.map(param => (
                    <LightButton
                      key={`${program.name}: ${param}`}
                      label={`${program.name}: ${param}`}
                      endpoint={program.endpoint}
                      param={param}
                    />
                  ))}
                </Box>
              ))}

            {/* Non-param programs grouped in a single box */}
            <Box className="single-programs" display="flex" flexDirection="column" alignItems="center">
              <h3>Single Programs</h3>
              {programs
                .filter(program => !Array.isArray(program.param))
                .map(program => (
                  <LightButton
                    key={program.name}
                    label={program.name}
                    endpoint={program.endpoint}
                  />
                ))}
            </Box>
          </>
        )  :
             <Box color="primary.contrastText">No Programs Found</Box>
            }
        </Box>
        </ThemeProvider>
    </div>
    );
}

export default App;