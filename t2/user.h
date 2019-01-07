#ifndef USER_HEADER_FILE
#define USER_HEADER_FILE

#include <string>
#include <iostream>

namespace user {
	struct User {
		std::string name;
		std::string password;
		User() = default;
		User(const std::string &n, const std::string &p): name(n), password(p) {}
		bool operator<(const User& u) const {
			return this->name<u.name;
		}
	};

	bool operator==(const User &u1, const User &u2) {
		return u1.name == u2.name && u1.password == u2.password;
	}

	std::istream &operator>>(std::istream &is, User &u) {
		return (is>>u.name>>u.password);
	}

	std::ostream &operator<<(std::ostream &os, const User &u) {
		return (os<<u.name<<std::endl<<u.password<<std::endl);
	}
}


#endif