const buildProfileUpdates = ({
    firstName,
    lastName,
    username,
    email,
    profileImage,

}) => {

    const updates = {};
    if (firstName) {
        updates.firstName = firstName;
    }
    if (lastName) {
        updates.lastName = lastName;
    }
    if (username) {
        updates.username = username.toLowerCase();
    }
    if (email) {
        updates.email = email.toLowerCase();
    }
    if (profileImage !== undefined) {
        updates.profileImage = profileImage;
    }
    return updates;
};


module.exports = {
    buildProfileUpdates,
};