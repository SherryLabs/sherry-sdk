import {
    HttpParameter,
    StandardParameter,
    SelectParameter,
    RadioParameter,
    INPUT_TYPES,
} from '../interface/httpAction';

export function isSelectParameter(param: HttpParameter): param is SelectParameter {
    return param.type === INPUT_TYPES.SELECT;
}

export function isRadioParameter(param: HttpParameter): param is RadioParameter {
    return param.type === INPUT_TYPES.RADIO;
}

export function isStandardParameter(param: HttpParameter): param is StandardParameter {
    return [INPUT_TYPES.STRING, INPUT_TYPES.NUMBER, INPUT_TYPES.BOOLEAN].includes(
        param.type as any,
    );
}

export function getInputType(param: HttpParameter): string {
    if (isSelectParameter(param)) {
        return INPUT_TYPES.SELECT;
    }

    if (isRadioParameter(param)) {
        return INPUT_TYPES.RADIO;
    }

    return param.type;
}
