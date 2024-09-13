import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient'; // Adjust path as needed
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    const { firstName, lastName, userName, email, password } = await request.json();

    if (!firstName || !lastName || !userName || !email || !password) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    try {
        // Check if the email already exists
        const { data: existingUsers, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email);

        if (fetchError) {
            throw fetchError;
        }

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email is already registered.' }, { status: 400 });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate a unique API key
        const apiKey = uuidv4();

        // Insert user into Supabase
        const { error: insertError } = await supabase.from('users').insert([
            {
                first_name: firstName,
                last_name: lastName,
                user_name: userName,
                email,
                password: passwordHash,
                api: apiKey, // Save the API key in the 'api' field
            },
        ]);

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ message: 'Sign up successful!', apiKey });
    } catch (err) {
        console.error('Error signing up:', err);
        return NextResponse.json({ error: 'Failed to sign up. Please try again.' }, { status: 500 });
    }
}
