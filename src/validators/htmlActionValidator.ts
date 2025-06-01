import { HTMLAction } from "../interface/actions/htmlAction";

export class HTMLActionValidator {
    static isHTMLAction(action: any): action is HTMLAction {
        return action && action.type === 'html' && typeof action.url === 'string';
    }
}
