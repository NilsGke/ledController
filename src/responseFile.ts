import fs from "fs";
import http from "http"

export const fileResponse = (fileName: string, response: http.ServerResponse) => {
    const filePath = "../app/build"; // or any file format

    // Check if file specified by the filePath exists
    fs.exists(filePath, function (exists) {
        if (exists) {
            // Content-type is very interesting part that guarantee that
            // Web browser will handle response in an appropriate manner.
            response.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=" + fileName
            });
            fs.createReadStream(filePath).pipe(response);
            return;
        }
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("ERROR File does not exist");
    });
}