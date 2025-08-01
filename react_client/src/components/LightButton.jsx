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

    return (
        <Button className="program-button" variant="contained" onClick={handleClick}>
        {props.label}
        </Button>
    );
};

export default LightButton;