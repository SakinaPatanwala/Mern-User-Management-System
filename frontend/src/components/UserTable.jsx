// import UserRow from "./UserRow";

// function UserTable({ users, fetchUsers }) {
//   return (
//     <table className="user-table">

//       <thead>
//         <tr>
//           <th>Name</th>
//           <th>Email</th>
//           <th>Actions</th>
//         </tr>
//       </thead>

//       <tbody>

//         {users.length === 0 ? (
//           <tr>
//             <td colSpan="3" style={{ textAlign: "center" }}>
//               No Users Found
//             </td>
//           </tr>
//         ) : (
//           users.map((user) => (
//             <UserRow
//               key={user.id}
//               user={user}
//               fetchUsers={fetchUsers}
//             />
//           ))
//         )}

//       </tbody>

//     </table>
//   );
// }

// export default UserTable;

import UserRow from "./UserRow";

function UserTable({ users, fetchUsers }) {
  return (
    <table className="user-table">

      <thead>

        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>

      </thead>

      <tbody>

        {users.map((user, index) => (
          <UserRow
            key={user.id}
            user={user}
            index={index}
            fetchUsers={fetchUsers}
          />
        ))}

      </tbody>

    </table>
  );
}

export default UserTable;