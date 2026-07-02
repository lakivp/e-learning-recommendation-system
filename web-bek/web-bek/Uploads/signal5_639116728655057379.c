#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <signal.h>
#include <unistd.h>

// Zadatak - Proces roditelj prekida proces dete


int main() {
	int pid;
	
	switch(pid = fork()) {
		case 0:
			printf("Dete proces, id=%d\n", getpid());
			sleep(30);
			printf("Dete proces zavrsava\n");
			exit(0);
		case -1:
			perror("Greska\n");
			exit(1);
		default:
			printf("Roditelj proces, id=%d\n", getpid());
			sleep(10);
			printf("Roditelj salje SIGINT signal\n");
			kill(pid, SIGINT);
			sleep(10);
			printf("Proces roditelj zavrsava\n");
	}

	return 0;
}
