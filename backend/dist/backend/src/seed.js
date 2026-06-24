"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const auth_1 = require("./auth");
async function main() {
    console.log('🌱 Seeding database...');
    const email = 'demo@forgeflow.com';
    const name = 'Demo User';
    const password = 'password123';
    let user = await db_1.db.user.findUnique({
        where: { email }
    });
    if (!user) {
        user = await db_1.db.user.create({
            data: {
                email,
                name,
                passwordHash: (0, auth_1.hashPassword)(password)
            }
        });
        console.log(`👤 Created demo user: ${email} (Password: ${password})`);
    }
    else {
        console.log(`👤 Demo user already exists: ${email}`);
    }
    // Create folder
    let folder = await db_1.db.folder.findFirst({
        where: { name: 'Customer Feedback', userId: user.id }
    });
    if (!folder) {
        folder = await db_1.db.folder.create({
            data: {
                name: 'Customer Feedback',
                userId: user.id
            }
        });
        console.log(`📂 Created folder: ${folder.name}`);
    }
    // Create a demo form
    const formCount = await db_1.db.form.count({
        where: { userId: user.id }
    });
    if (formCount === 0) {
        const demoForm = await db_1.db.form.create({
            data: {
                title: 'Customer Satisfaction Survey',
                description: 'Help us improve our service by answering a few quick questions.',
                published: true,
                userId: user.id,
                folderId: folder.id,
                settings: {
                    successMessage: 'Thank you! Your feedback has been recorded.',
                    theme: {
                        primaryColor: '#6366f1',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.75rem',
                        fontFamily: 'Inter'
                    }
                },
                schema: [
                    {
                        id: 'name_field',
                        type: 'text',
                        properties: {
                            label: 'Full Name',
                            placeholder: 'John Doe',
                            required: true,
                            width: '100'
                        }
                    },
                    {
                        id: 'email_field',
                        type: 'email',
                        properties: {
                            label: 'Email Address',
                            placeholder: 'john@example.com',
                            required: true,
                            width: '100'
                        }
                    },
                    {
                        id: 'rating_field',
                        type: 'rating',
                        properties: {
                            label: 'Rate your overall experience',
                            required: true,
                            min: 1,
                            max: 5,
                            width: '100'
                        }
                    },
                    {
                        id: 'feedback_field',
                        type: 'paragraph',
                        properties: {
                            label: 'Any additional feedback?',
                            placeholder: 'Tell us what you liked or how we can improve...',
                            required: false,
                            width: '100'
                        }
                    }
                ]
            }
        });
        console.log(`📝 Created demo form: "${demoForm.title}"`);
    }
    console.log('✅ Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.db.$disconnect();
});
