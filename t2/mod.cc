#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "user.h"

using namespace std;
using namespace user;

int main(int argc, char const *argv[])
{
	if (argc != 4)
		return 1;
	User log(argv[1], argv[2]);
	string new_password(argv[3]);

	ifstream ifs("pwd");
	vector<User> v;
	User tem;
	while (ifs>>tem){
		v.push_back(tem);
	}
	ifs.close();

	auto l = lower_bound(v.begin(), v.end(), log);

	if (*l == log)
	{
		l->password = new_password;
		ofstream ofs("pwd");
		std::for_each(v.begin(), v.end(), [&ofs](User &u) { ofs<<u; });
		ofs.close();
		return 0;
	} else {
		return 1;
	}
}
