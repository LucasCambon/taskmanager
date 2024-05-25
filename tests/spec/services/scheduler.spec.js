const { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified } = require('../../../src/services/nofiticationService');
const scheduledTask = require('../../../src/services/scheduledTask');

// Mock dependencies
jest.mock('../../../src/services/nofiticationService', () => ({
    getNearbyTasks: jest.fn(),
    sendEmail: jest.fn(),
    sendWhatsAppMessage: jest.fn(),
    markTaskAsNotified: jest.fn(),
}));

describe('scheduledTask', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
    });

    it('should send notifications for nearby tasks and mark them as notified', async () => {
        const mockTasks = [
            {
                id: 1,
                title: 'Task 1',
                dueDate: new Date(),
                User: { email: 'test@example.com', phoneNumber: '+1234567890' },
            },
        ];
        getNearbyTasks.mockResolvedValue(mockTasks);

        await scheduledTask();

        expect(getNearbyTasks).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalledWith(
            'test@example.com',
            'Tarea cercana',
            `Recordatorio: La tarea "Task 1" tiene una fecha límite ${mockTasks[0].dueDate}.`
        );
        expect(sendWhatsAppMessage).toHaveBeenCalledWith(
            '+1234567890',
            `Recordatorio: La tarea "Task 1" tiene una fecha límite ${mockTasks[0].dueDate}.`
        );
        expect(markTaskAsNotified).toHaveBeenCalledWith(1);
    });

    it('should handle errors and continue processing other tasks', async () => {
        const mockTasks = [
            {
                id: 1,
                title: 'Task 1',
                dueDate: new Date(),
                User: { email: 'test@example.com', phoneNumber: '+1234567890' },
            },
            {
                id: 2,
                title: 'Task 2',
                dueDate: new Date(),
                User: { email: 'test2@example.com', phoneNumber: '+0987654321' },
            },
        ];
        getNearbyTasks.mockResolvedValue(mockTasks);

        await scheduledTask();
    
    
        sendEmail.mockResolvedValueOnce();
        sendEmail.mockRejectedValueOnce(new Error('Email error'));
    
    
        sendWhatsAppMessage.mockResolvedValue();
    
    
        markTaskAsNotified.mockResolvedValue();
    
        expect(sendEmail.mock.calls[0][0]).toBe('test@example.com');
        expect(sendEmail.mock.calls[0][1]).toBe('Tarea cercana');
        expect(sendEmail.mock.calls[0][2]).toContain(`Recordatorio: La tarea "Task 1" tiene una fecha límite`);
        expect(sendWhatsAppMessage.mock.calls[0][0]).toBe('+1234567890');
        expect(sendWhatsAppMessage.mock.calls[0][1]).toContain(`Recordatorio: La tarea "Task 1" tiene una fecha límite`);
    
        expect(sendEmail.mock.calls[1][0]).toBe('test2@example.com');
        expect(sendEmail.mock.calls[1][1]).toBe('Tarea cercana');
        expect(sendEmail.mock.calls[1][2]).toContain(`Recordatorio: La tarea "Task 2" tiene una fecha límite`);
        expect(sendWhatsAppMessage.mock.calls[1][0]).toBe('+0987654321');
        expect(sendWhatsAppMessage.mock.calls[1][1]).toContain(`Recordatorio: La tarea "Task 2" tiene una fecha límite`);
    });
    
    

    it('should handle errors when marking tasks as notified', async () => {
        const mockTasks = [
            {
                id: 1,
                title: 'Task 1',
                dueDate: new Date(),
                User: { email: 'test@example.com', phoneNumber: '+1234567890' },
            },
        ];
        getNearbyTasks.mockResolvedValue(mockTasks);

        sendEmail.mockResolvedValue();
        sendWhatsAppMessage.mockResolvedValue();
        markTaskAsNotified.mockRejectedValue(new Error('Mark as notified error'));

        await scheduledTask();

        expect(markTaskAsNotified).toHaveBeenCalledWith(1);
    });
});
