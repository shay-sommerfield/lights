import React from 'react';
import Button from '@mui/material/Button';

function LightButton (props) {
    //connect to light server and connect to given endpoint on button click
    const handleClick = async () => {
        try {
            const response = await fetch(`/express/${props.endpoint}/${props.param || ''}`);
            console.log(`Fetching data from /express/${props.endpoint}/${props.param || ''}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
                }
            const data = await response.json();
            console.log(`Data from ${props.endpoint}:`, data);
        } catch (error) {
        console.error(`Error fetching ${props.endpoint}:`, error);
        }
    };

    // Disable the button if the endpoint is 'run_binary_counter'
    // This is a placeholder condition until this functionality is implemented
    const isBinaryCounter = props.endpoint === 'run_binary_counter';

    return (
        <Button 
            className="program-button" 
            variant="contained" 
            onClick={handleClick}
            disabled={isBinaryCounter}
        >
        {props.label}
        </Button>
    );
};

export default LightButton;