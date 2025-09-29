import { http } from "./http";

// Унифицированный вызов: либо присылаем predictions в теле,
// либо сервер сам сгенерит синтетические.
export const CalibrationAPI = {
    run: (body = {}) => http.post("/calibrate", body).then(r => r.data),
};
