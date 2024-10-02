import {Accordion} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import FileList from "../../../../modals/FileList";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketFiles = ({ticket, eventKey, activeKey, handleAccordionToggle}) => {
    const [files, setFiles] = useState([]);




    useEffect( () => {
        fetchFiles();
    },[]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/files/${ticket.id}`);
            setFiles(response.data);
        } catch (error) {
            console.error(error.message);
        }
    }


    return (
        <>
            <Accordion activeKey={activeKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Accordion.Header onClick={() => handleAccordionToggle(eventKey)}>
                        Files
                    </Accordion.Header>
                    <Accordion.Body>
                        <FileList
                            files={files}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>


        </>
    );


}

export default NewTicketFiles