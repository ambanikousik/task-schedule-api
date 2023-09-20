

import { z } from "zod";


export const taskTypeSchema = z.object({
    user_id: z.number(
        { required_error: "User id is required" }
    ),
    execute_after: z.number(
        { required_error: "Duration is required" }
    ),
    time: z.string(
        { required_error: "Time is required" }
    )
}).partial().refine(
    ({ user_id, execute_after, time }) => {
        return (execute_after !== undefined || time !== undefined) && user_id !== undefined;
    },
    { message: "One of the fields must be defined" }
);





