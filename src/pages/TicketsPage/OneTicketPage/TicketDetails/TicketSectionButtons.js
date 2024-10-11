import React from 'react';
import { Button } from 'react-bootstrap';

const TicketSectionButtons = ({ activeSection, onSectionChange }) => {
    return (
        <div className="activityButtonsSection">
            <Button
                onClick={() => onSectionChange('activity')}
                size="sm"
                className={`activityButtons ms-2 ${activeSection === 'activity' ? 'active' : ''}`}
            >
                Activity
            </Button>
            <Button
                onClick={() => onSectionChange('info')}
                size="sm"
                className={`activityButtons ms-2 ${activeSection === 'info' ? 'active' : ''}`}
            >
                Inside Info
            </Button>
            {/*<Button*/}
            {/*    onClick={() => onSectionChange('response')}*/}
            {/*    size="sm"*/}
            {/*    className={`activityButtons ms-2 ${activeSection === 'response' ? 'active' : ''}`}*/}
            {/*>*/}
            {/*    Response*/}
            {/*</Button>*/}
        </div>
    );
};

export default TicketSectionButtons;
