"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello, TypeScript Express!');
});
//   const tasks: Task[] = [];
const taskValidationRules = [
    (0, express_validator_1.body)('user_id').isInt().notEmpty().withMessage('User id is required'),
    (0, express_validator_1.oneOf)([
        (0, express_validator_1.body)('duration').isInt(),
        (0, express_validator_1.body)('time').isTime({
            hourFormat: 'hour24',
            mode: 'default',
        }),
    ], { message: 'Duration or time is required' })
];
app.post('/', taskValidationRules, (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.send('Hello, TypeScript Express!');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
