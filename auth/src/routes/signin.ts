import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@vegasdevapps/tickets-common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

const validations = [
    body('email')
        .isEmail()
        .withMessage('Email must be valide'),
    body('password')
        .trim()
        .notEmpty()
    .withMessage('You must supply a password')
];

router.post('/api/users/signin', validations, validateRequest, async (req: Request, res: Response) => {
    
    
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if (!passwordsMatch) {
        throw new BadRequestError('Invalid credentials');
    }

    // Generate JWT
    const usetJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY!);

    // Store it in session object
    req.session = { jwt: usetJwt };

    res.status(200).send(existingUser);

});

export { router as signinRouter };