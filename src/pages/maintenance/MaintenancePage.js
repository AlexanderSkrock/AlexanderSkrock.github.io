import React from "react";
import { Page } from "grommet";

import MaintenanceImage from "./maintenance.svg";
import FullPageImage from "../../components/FullPageImage";
import FullPageContent from "../../components/FullPageContent";

const MaintenancePage = () => (
  <Page>
    <FullPageContent>
      <FullPageImage src={ MaintenanceImage } alt="Currently down for maintenance!" />
    </FullPageContent>
  </Page>
);

export default MaintenancePage;
