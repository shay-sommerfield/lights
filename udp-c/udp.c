#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>  // Include this header for the `close` function

#define LIGHT1 "192.168.1.112"
#define LIGHT2 "192.168.1.115"
#define LIGHT3 "192.168.1.116"
#define PORT 38899              // Replace with your server's port
#define ON_MESSAGE "{\"id\":1,\"method\":\"setState\",\"params\":{\"state\":true}}"
#define OFF_MESSAGE "{\"id\":1,\"method\":\"setState\",\"params\":{\"state\":false}}"


// Function to send a UDP message to a specified IP and port
int send_udp_message(const char *message, size_t message_len, const char *ip_address, int port) {
    struct sockaddr_in server_addr;
    int sock;
    int result;

    // Create the socket
    if ((sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) == -1) {
        perror("Socket creation failed");
        return -1;
    }

    // Zero out the server address structure
    memset(&server_addr, 0, sizeof(server_addr));

    server_addr.sin_family = AF_INET;  // IPv4
    server_addr.sin_port = htons(port);  // Port
    server_addr.sin_addr.s_addr = inet_addr(ip_address);  // IP address

    // Send the message
    result = sendto(sock, message, message_len, 0, (struct sockaddr*)&server_addr, sizeof(server_addr));
    if (result == -1) {
        perror("sendto failed");
        close(sock);
        return -1;
    }

    printf("Message sent to %s:%d\n", ip_address, port);

    // Close the socket
    close(sock);

    return 0;
}

int main(void) {
    const char *message = ON_MESSAGE;
    const char *ip_address = LIGHT1;  // Replace with your IP address
    int port = PORT;  // Replace with your port

    const char *ip_addresses[] = {
        LIGHT1,
        LIGHT2,
        LIGHT3
    };

    // Number of IP addresses in the array
    int num_ips = sizeof(ip_addresses) / sizeof(ip_addresses[0]);

    // Loop through each IP address and send the message
    for (int i = 0; i < num_ips; i++) {
        if (send_udp_message(message, strlen(message), ip_addresses[i], port) == 0) {
            printf("Message sent successfully to %s\n", ip_addresses[i]);
        } else {
            printf("Failed to send message to %s\n", ip_addresses[i]);
        }
    }

    return 0;
}
