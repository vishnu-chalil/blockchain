pragma solidity ^0.4.11;

contract Profile {
    struct Emplyee {
        string name;
        uint age;
        uint weight;
    }
    Emplyee public employee;
    
    
    function addNewPerson(string _name, uint _age, uint _weight) public {
        employee.name = _name;
        employee.age = _age;
        employee.weight = _weight;
    }
    function getName() public returns (string) {
        return employee.name;
    }
}