import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const dateFormater = new Intl.DateTimeFormat(window.context.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    // timeZone: "UTC",
});

export const formatDateFromMs = (ms: number) => {
    return dateFormater.format(ms);
}

export const cn = (...args: ClassValue[]) => {
    return twMerge(clsx(...args))
}