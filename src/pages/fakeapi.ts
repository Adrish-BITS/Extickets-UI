// fakeApi.ts
export function uploadTicketApi(ticketData: any): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000); // simulate network delay
    });
  }
  