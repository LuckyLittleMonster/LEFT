#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "user.h"

using namespace std;
using namespace user;

int main(int argc, char const *argv[])
{
	if (argc != 3)
		return 1;
	User log(argv[1], argv[2]);
	ifstream ifs("pwd");
	vector<User> v;
	User tem;
	while (ifs>>tem){
		v.push_back(tem);
	}
	ifs.close();
	auto l = std::lower_bound(v.begin(), v.end(), log);
	return !(*l==log);

}
