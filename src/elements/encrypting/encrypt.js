import React, {useState, useRef, useEffect} from "react";
import { 
    ButtonGroup, Stack, Button
} from 'react-bootstrap';

const Encrypt = () => {
    return (
        <>
            <Stack gap={3}>
                <ButtonGroup>
                    <Button>add signed message</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Encrypt;