const db = require('../../../src/database/models');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified } = require('../../../src/services/nofiticationService');

// Mock dependencies
jest.mock('../../../src/database/models');
jest.mock('nodemailer');
jest.mock('twilio', () => {
    const twilioMock = {
        messages: {
            create: jest.fn()
        }
    };
    return jest.fn(() => twilioMock);
});

describe('Notification Service', () => {
    describe('getNearbyTasks', () => {
        it('should return tasks with due dates within the next 3 days and not notified', async () => {
            // Mock the database response
            const mockTasks = [
                { id: 1, title: 'Task 1', dueDate: new Date(), notified: false, User: { email: 'test@example.com', phoneNumber: '+1234567890' } },
            ];
            db.Task.findAll.mockResolvedValue(mockTasks);

            const tasks = await getNearbyTasks();
            expect(tasks).toEqual(mockTasks);
        });

        it('should throw an error if database query fails', async () => {
            // Mock the database to throw an error
            db.Task.findAll.mockRejectedValue(new Error('Database error'));

            await expect(getNearbyTasks()).rejects.toThrow('Database error');
        });
    });

    describe('sendEmail', () => {
        it('should send an email', async () => {
            const mockSendMail = jest.fn().mockResolvedValue({ response: 'Email sent' });
            nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

            await sendEmail('test@example.com', 'Test Subject', 'Test Body');
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'cambonlucas26@gmail.com',
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Body',
            });
        });

        it('should throw an error if sending email fails', async () => {
            const mockSendMail = jest.fn().mockRejectedValue(new Error('Email error'));
            nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

            await expect(sendEmail('test@example.com', 'Test Subject', 'Test Body')).rejects.toThrow('Email error');
        });
    });

    describe('sendWhatsAppMessage', () => {
        it('should send a WhatsApp message', async () => {
            const twilioClient = twilio();
            const mockCreate = twilioClient.messages.create;

            mockCreate.mockResolvedValue({});

            await sendWhatsAppMessage('+1234567890', 'Test Message');
            expect(mockCreate).toHaveBeenCalledWith({
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+1234567890',
                body: 'Test Message',
            });
        });

        it('should throw an error if sending WhatsApp message fails', async () => {
            const twilioClient = twilio();
            const mockCreate = twilioClient.messages.create;

            mockCreate.mockRejectedValue(new Error('WhatsApp error'));

            await expect(sendWhatsAppMessage('+1234567890', 'Test Message')).rejects.toThrow('WhatsApp error');
        });
    });

    describe('markTaskAsNotified', () => {
        it('should mark a task as notified', async () => {
            const mockTask = { id: 1, notified: false, save: jest.fn() };
            db.Task.findByPk.mockResolvedValue(mockTask);

            await markTaskAsNotified(1);
            expect(mockTask.notified).toBe(true);
            expect(mockTask.save).toHaveBeenCalled();
        });

        it('should throw an error if task is not found', async () => {
            db.Task.findByPk.mockResolvedValue(null);

            await expect(markTaskAsNotified(1)).rejects.toThrow('Task not found');
        });

        it('should throw an error if saving task fails', async () => {
            const mockTask = { id: 1, notified: false, save: jest.fn().mockRejectedValue(new Error('Save error')) };
            db.Task.findByPk.mockResolvedValue(mockTask);

            await expect(markTaskAsNotified(1)).rejects.toThrow('Save error');
        });
    });
});