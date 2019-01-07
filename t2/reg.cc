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

	if (!std::binary_search(v.begin(), v.end(), log))
	{
		ofstream ofs("pwd");
		v.push_back(log);
		std::sort(v.begin(), v.end());
		std::for_each(v.begin(), v.end(), [&ofs](User &u) { ofs<<u; });
		ofs.close();
		return 0;
	} else {
		return 1;
	}

}
