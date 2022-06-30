const LinksSocialMedia = {
  github: 'milin22',
  youtube: 'channel/UC1xdCSc7FGo6IfjWGBxAKYw',
  facebook: '100005803123496',
  instagram: 'lia.chamchi',
  twitter: 'DevDalton'
}
function changeSocialMediaLinks() {
  for (let li of socialLinks.children) {
    const social = li.getAttribute('class')

    li.children[0].href = `http://${social}.com/${LinksSocialMedia[social]}`
  }
}
changeSocialMediaLinks()


