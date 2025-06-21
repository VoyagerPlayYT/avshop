class OrderManager {
    constructor() {
        this.orders = new Map();
        this.orderCounter = 1;
    }

    createOrder(userId, productId, product, paymentMethod) {
        const orderId = this.orderCounter++;
        const order = {
            id: orderId,
            userId: userId,
            productId: productId,
            product: product,
            paymentMethod: paymentMethod,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.orders.set(orderId, order);
        return order;
    }

    getOrder(orderId) {
        return this.orders.get(orderId);
    }

    getUserOrders(userId) {
        return Array.from(this.orders.values()).filter(order => order.userId === userId);
    }

    getAllOrders() {
        return Array.from(this.orders.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    updateOrderStatus(orderId, status, notes = '') {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date();
            if (notes) {
                order.notes = notes;
            }
            return order;
        }
        return null;
    }

    markOrderAsPaid(orderId, paymentInfo = {}) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = 'paid';
            order.paidAt = new Date();
            order.paymentInfo = paymentInfo;
            order.updatedAt = new Date();
            return order;
        }
        return null;
    }

    markOrderAsCompleted(orderId) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = 'completed';
            order.completedAt = new Date();
            order.updatedAt = new Date();
            return order;
        }
        return null;
    }

    getPendingOrders() {
        return Array.from(this.orders.values())
            .filter(order => order.status === 'pending' || order.status === 'paid')
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    getOrderStats() {
        const orders = Array.from(this.orders.values());
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            paid: orders.filter(o => o.status === 'paid').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };
    }
}

module.exports = new OrderManager();
