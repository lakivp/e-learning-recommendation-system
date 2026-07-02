#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

// Defunct, zombie

int main(void)
{
	pid_t pid;
	int rv;
	pid = fork();
	switch (pid) {
		case -1:
			perror("Fork greska\n");
			exit(1);
		case 0:
			printf(" DETE: Ovo je proces dete!\n");
			printf(" DETE: Moj PID je %d\n", getpid());
			printf(" DETE: PID mog roditelja je %d\n", getppid());
			printf(" DETE: Ja zavrsavam!\n");
			exit(0);
		default:
			printf("RODITELJ: Ovo je proces roditelj!\n");
			printf("RODITELJ: Moj PID je %d\n", getpid());
			printf("RODITELJ: PID mog deteta je %d\n", pid);
			printf(" RODITELJ: Idem u sleep: \n");
			sleep(60);
			wait(&rv);
			printf("RODITELJ: Dete je izaslo sa statusom %d\n", WEXITSTATUS(rv));
			printf("RODITELJ: Ja zavrsavam\n");	
	}
	return 0;
}
