import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'BI2',
        price: 150,
        userId: 'asd'
    });

    // Save the ticket to the database
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two separate changes to the tickets we fetching
    firstInstance!.set({ price: 160 });
    secondInstance!.set({ price: 179 });

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }
    throw new Error('Should not reach this point');
});

it('incriments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'rock-fest',
        price: 300,
        userId: 'wdfs'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);

});