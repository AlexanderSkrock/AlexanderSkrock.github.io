import React from "react";
import { Page } from "grommet";

import Contacts from "./Contacts";
import FullPageContent from "../../components/FullPageContent";

const ContactPage = () => {
    return (
        <Page data-testid="contactPage">
            <FullPageContent align="center" justify="around">
                <Contacts />
            </FullPageContent>
        </Page>
    );
}

export default ContactPage;
