
#include <unistd.h>    
#include <signal.h>    
#include <stdio.h>
#include <stdlib.h>
pid_t pid_dete;

// Kada se terminal diskonektuje, salje se signal SIGHUP svih procesima 
void uhvati_signal(int sig_num)
{
    printf("Signal uhvacen");
    printf("Ignorisem....\n");
}

int main(void)
{
    int x;
    //signal(SIGHUP, uhvati_signal);
    pid_dete = fork();
    while(1);
}