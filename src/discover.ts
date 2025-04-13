import { findWizLights } from "./wiz-udp";
import { WizLights} from './wizlights';

type LightFilterFunction = (light: WizLights.Light) => boolean;

/**
 * Sends a broadcast message to find all lights that are connected
 * to the network. 
 * 
 * @param filterFunction: A function that will filter for a Wizlights.Light with specific settings.
 * @returns Wizlights.Light
 */
export async function discover(filterFunction: LightFilterFunction = () => true ): Promise<WizLights.Light[]> {
    const infoArr = await findWizLights();
    const lights = infoArr.map((info) => new WizLights.Light(info))
    return lights.filter(filterFunction);
}
