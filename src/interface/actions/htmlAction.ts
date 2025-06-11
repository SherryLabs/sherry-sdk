import { BaseAction } from './action';

export interface HTMLAction extends BaseAction {
    type: 'html';
    label: string;
    url: string;
    width?: number;
    height?: number;
    fullscreen?: boolean;
}
