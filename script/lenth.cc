#include <iostream>
#include <string>
#include <chrono>
#include <thread>

using namespace std;

int main(int argc, char const *argv[])
{
	std::this_thread::sleep_for(std::chrono::milliseconds(600));
	string str;
	while(cin>>str){
		cout<<str.length()<<endl;
	}
	
	return 0;
}