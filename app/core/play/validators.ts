export function isGroupAdmin({group, user}: {group: {members: {captain: boolean, memberId: string}[]}, user: {id: string}}) {
    return group.members.some(
        (member) => member.captain && member.memberId === user.id
      )
}