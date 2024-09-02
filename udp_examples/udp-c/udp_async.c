#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <pthread.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>

#define LIGHT1 "192.168.1.112"
#define LIGHT2 "192.168.1.115"
#define LIGHT3 "192.168.1.116"
#define PORT 38899

#define ON_MESSAGE "{\"id\":1,\"method\":\"setState\",\"params\":{\"state\":true}}"
#define OFF_MESSAGE "{\"id\":1,\"method\":\"setState\",\"params\":{\"state\":false}}"

// Structure to hold the arguments for each thread
typedef struct {
    const char *message;
    size_t message_len;
    const char *ip_address;
    int port;
    int sock;
    struct sockaddr_in server_addr;
} thread_args_t;

int create_socket() {
    int sock;
    
    // Create the socket
    if ((sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) == -1) {
        perror("Socket creation failed");
        return -1;
    }
    
    return sock;
}

struct sockaddr_in create_server_address(const char *ip_address, int port) {
    struct sockaddr_in server_addr;

    // Zero out the server address structure
    memset(&server_addr, 0, sizeof(server_addr));

    server_addr.sin_family = AF_INET;  // IPv4
    server_addr.sin_port = htons(port);  // Port
    server_addr.sin_addr.s_addr = inet_addr(ip_address);  // IP address

    return server_addr;
}

int send_udp_message(const char *message, size_t message_len, const char *ip_address, int port, int sock, struct sockaddr_in server_addr) {
    int result;
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

// Thread function to send a UDP message
void* thread_function(void* arg) {
    thread_args_t *args = (thread_args_t*)arg;
    send_udp_message(args->message, args->message_len, args->ip_address, args->port, args->sock, args->server_addr);
    return NULL;
}

int main(void) {
    const char *message = ON_MESSAGE;

    
    // Array of IP addresses to send the message to
    const char *ip_addresses[] = {
        LIGHT3,
        LIGHT2,
        LIGHT1
    };
    
    // Number of IP addresses in the array
    int num_ips = sizeof(ip_addresses) / sizeof(ip_addresses[0]);
    
    // Array to hold thread IDs
    pthread_t threads[num_ips];
    
    // Array to hold thread arguments
    thread_args_t thread_args[num_ips];
    
    // Create and start threads
    for (int i = 0; i < num_ips; i++) {
        thread_args[i].message = message;
        thread_args[i].message_len = strlen(message);
        thread_args[i].ip_address = ip_addresses[i];
        thread_args[i].port = PORT;
        thread_args[i].sock = create_socket();
        thread_args[i].server_addr = create_server_address(ip_addresses[i], PORT);
        
        if (pthread_create(&threads[i], NULL, thread_function, &thread_args[i]) != 0) {
            perror("Failed to create thread");
            return 1;
        }
    }
    
    // Wait for all threads to finish
    for (int i = 0; i < num_ips; i++) {
        pthread_join(threads[i], NULL);
    }
    
    return 0;
}
