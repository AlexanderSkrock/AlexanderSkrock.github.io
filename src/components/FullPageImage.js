import { Image } from "grommet";
import FullPageBox from "./FullPageBox";

const FullPageImage = (props) => (
    <FullPageBox>
        <Image { ...props } fit="contain" />
    </FullPageBox>
);

export default FullPageImage;