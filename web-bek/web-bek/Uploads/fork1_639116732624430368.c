#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

/*
Razdvajanje roditelja i deteta
* 
* ps ax | grep izvrsni
* pstree -p -s PID
* kill -9 $(ps aux | grep izvrsni | awk '{print $2}')
* 
*/

int main(void)
{
	
	pid_t pid;
	pid = fork();
	if (pid==-1) {
		printf("Fork greska\n");
	}
	else if (pid==0) { //Dete
		printf(" DETE: Ovo je proces dete!\n");
		printf(" DETE: Moj PID je %d\n", getpid());
		printf(" DETE: PID mog roditelja je %d\n", getppid());
		sleep(60);
		//while(1);
		printf(" DETE: Ja zavrsavam!\n");
	}
	else { //Roditelj
		printf("RODITELJ: Ovo je proces roditelj!\n");
		printf("RODITELJ: Moj PID je %d\n", getpid());
		printf("RODITELJ: PID mog deteta je %d\n", pid);
		printf("RODITELJ: PID mog roditelja je %d\n", getppid());
		sleep(60);
		printf("RODITELJ: Ja zavrsavam\n");
	}
	return 0;
}
